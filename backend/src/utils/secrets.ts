/* utils/secrets.ts
 * Fetch a single JSON-formatted secret once per process and
 * copy every entry into process.env.
 */
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";


const REGION     = process.env.AWS_REGION  || "us-east-1";            // already in the secret too
const SECRET_ARN = process.env.SECRET_ARN || "/RaabtaNow-Fayzan-testing/backend-env";

// let loaded = false;

export async function loadSecrets(): Promise<void> {
    console.log("🔑 Loading secrets from AWS Secrets Manager...");
//   if (loaded) return;                           // cache across hot-reloads / Lambda re-use

  const sm   = new SecretsManagerClient({ region: REGION });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ARN }));

  console.log(`🔑 Secrets ARN: ${resp.ARN}`);
  console.log("response: ", resp.SecretString);

  if (!resp.SecretString) throw new Error("❌ SecretString is empty");

  const json = JSON.parse(resp.SecretString);
  Object.entries<string>(json).forEach(([k, v]) => (process.env[k] = v));

//   loaded = true;
  console.log(`✅ Loaded ${Object.keys(json).length} secrets`);
}
