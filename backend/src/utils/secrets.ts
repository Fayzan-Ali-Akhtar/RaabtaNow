import { SecretsManagerClient, GetSecretValueCommand }
  from "@aws-sdk/client-secrets-manager";

const REGION     = process.env.AWS_REGION  || "us-east-1";
const SECRET_ARN = process.env.SECRET_ARN || "/RaabtaNow-Fayzan-testing/backend-env";

/** Download the secret and return the parsed key/value map */
export async function fetchSecrets(): Promise<Record<string, string>> {
  const sm   = new SecretsManagerClient({ region: REGION });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ARN }));

  if (!resp.SecretString) throw new Error("SecretString empty");
  const json = JSON.parse(resp.SecretString) as Record<string, string>;

  console.log(`✅ fetched ${Object.keys(json).length} secrets from Secrets Manager`);
  return json;
}
