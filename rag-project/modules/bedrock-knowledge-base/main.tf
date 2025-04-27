data "aws_caller_identity" "current" {}

# provider "opensearch" {
#   opensearch = opensearch  # This refers to the opensearch-project provider
#   url        = aws_opensearchserverless_collection.collection.collection_endpoint
#   aws_region = aws.region.name
#   healthcheck = false
# }

resource "aws_opensearchserverless_collection" "collection" {
  name             = "${var.name_prefix}-collection"
  type             = "VECTORSEARCH"
  standby_replicas = var.standby_replicas_enabled ? "ENABLED" : "DISABLED"

  depends_on = [aws_opensearchserverless_security_policy.encryption_policy]
}

resource "aws_opensearchserverless_security_policy" "encryption_policy" {
  name        = "${var.name_prefix}-encryption-policy"
  type        = "encryption"
  description = "encryption policy for ${var.name_prefix}-collection"
  policy = jsonencode({
    Rules = [
      {
        Resource = [
          "collection/${var.name_prefix}-collection"
        ],
        ResourceType = "collection"
      }
    ],
    AWSOwnedKey = true
  })
}

resource "aws_opensearchserverless_security_policy" "network_policy" {
  name        = "${var.name_prefix}-network-policy"
  type        = "network"
  description = "public access for dashboard, VPC access for collection endpoint"
  policy = jsonencode([
    {
      Description = "Public access for dashboards and collection",
      Rules = [
        {
          ResourceType = "collection",
          Resource = [
            "collection/${var.name_prefix}-collection"
          ]
        },
        {
          ResourceType = "dashboard"
          Resource = [
            "collection/${var.name_prefix}-collection"
          ]
        }
      ],
      AllowFromPublic = true
    }
  ])
}

resource "aws_opensearchserverless_access_policy" "data_access_policy" {
  name        = "${var.name_prefix}-data-access-policy"
  type        = "data"
  description = "allow index and collection access"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "index",
          Resource = [
            "index/${var.name_prefix}-collection/*"
          ],
          Permission = [
            "aoss:*"
          ]
        },
        {
          ResourceType = "collection",
          Resource = [
            "collection/${var.name_prefix}-collection"
          ],
          Permission = [
            "aoss:*"
          ]
        }
      ],
      Principal = concat(
        [data.aws_caller_identity.current.arn, aws_iam_role.bedrock.arn],
        var.additional_data_access_principals
      )
    }
  ])
}

resource "opensearch_index" "vector_index" {
  name = var.vector_index_name

  mappings = jsonencode({
    properties = {
      "${var.metadata_field}" = {
        type  = "text"
        index = false
      }

      "${var.text_field}" = {
        type  = "text"
        index = true
      }

      "${var.vector_field}" = {
        type      = "knn_vector"
        dimension = var.vector_dimension
        method = {
          engine = "faiss"
          name   = "hnsw"
        }
      }
    }
  })

  depends_on = [aws_opensearchserverless_collection.collection]
}

data "aws_bedrock_foundation_model" "embedding" {
  model_id = var.embedding_model_id
}

resource "aws_bedrockagent_knowledge_base" "this" {
  name     = var.knowledge_base_name
  role_arn = aws_iam_role.bedrock.arn

  knowledge_base_configuration {
    type = "VECTOR"
    vector_knowledge_base_configuration {
      embedding_model_arn = data.aws_bedrock_foundation_model.embedding.model_arn
    }
  }

  storage_configuration {
    type = "OPENSEARCH_SERVERLESS"
    opensearch_serverless_configuration {
      collection_arn    = aws_opensearchserverless_collection.collection.arn
      vector_index_name = var.vector_index_name
      field_mapping {
        vector_field   = var.vector_field
        text_field     = var.text_field
        metadata_field = var.metadata_field
      }
    }
  }

  depends_on = [aws_iam_role.bedrock]
}

resource "aws_bedrockagent_data_source" "this" {
  for_each = { for ds in var.data_sources : ds.name => ds }

  knowledge_base_id = aws_bedrockagent_knowledge_base.this.id
  name              = each.value.name
  data_source_configuration {
    type = each.value.type
    s3_configuration {
      bucket_arn = each.value.bucket_arn
      inclusion_prefixes = try(each.value.inclusion_prefixes, null)
    }
  }

  depends_on = [aws_bedrockagent_knowledge_base.this]
}

resource "aws_iam_role" "bedrock" {
  name                = "${var.name_prefix}-bedrock-role"
  managed_policy_arns = [aws_iam_policy.bedrock.arn]

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "bedrock" {
  name = "${var.name_prefix}-bedrock-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Action   = ["bedrock:InvokeModel"]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "aoss:APIAccessAll",
          ]
          Effect   = "Allow"
          Resource = "arn:aws:aoss:${var.region}:${data.aws_caller_identity.current.account_id}:collection/*"
        }
      ],
      [for bucket in var.data_source_buckets : {
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
        ]
        Effect   = "Allow"
        Resource = bucket
      }]
    )
  })
}

resource "aws_s3_bucket_cors_configuration" "this" {
  for_each = { for bucket in var.data_source_buckets : bucket => bucket }

  bucket = split(":", each.value)[5]

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ]
    allowed_origins = ["*"]
  }
}