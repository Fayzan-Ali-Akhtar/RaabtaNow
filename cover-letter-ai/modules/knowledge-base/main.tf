module "bedrock" {
  source  = "aws-ia/bedrock/aws"
  version = "0.0.20"

  create_default_kb = true
  foundation_model  = "anthropic.claude-v2"


}


provider "opensearch" {
  url         = module.bedrock.default_collection.collection_endpoint
  healthcheck = false
}

module "bedrock" {
  source  = "aws-ia/bedrock/aws"
  version = "0.0.20"
  create_default_kb = true
  foundation_model = "anthropic.claude-v2"
  instruction = "You are an automotive assisant who can provide detailed information about cars to a customer."


}