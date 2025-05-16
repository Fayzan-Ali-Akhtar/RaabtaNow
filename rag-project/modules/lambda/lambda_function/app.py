import boto3
import json

def lambda_handler(event, context):
    client = boto3.client('bedrock-agent-runtime', region_name='us-east-1')

    # Configuration
    knowledge_base_id = 'FF9IEMBXVE'  
    model_arn = 'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0'
    

    try:
        body = json.loads(event['body'])
        
        job_title = body.get('job_title', '')
        company_name = body.get('company_name', '')
        user_profile = body.get('user_profile', {})
        query = body.get('query', '')

        name = user_profile.get("name", "")
        experience = user_profile.get("experience", "")
        skills = user_profile.get("skills", [])
        achievements = user_profile.get("achievements", "")
        education = user_profile.get("education", "")
        tone = user_profile.get("tone", "professional")
        highlight = user_profile.get("highlight", "")

        # Convert skills to comma-separated list
        skills_str = ", ".join(skills)

        # Build prompt
        prompt = f"""
        Write a {tone} cover letter for the position of {job_title} at {company_name}.

        Candidate Details:
        - Name: {name}
        - Years of Experience: {experience}
        - Education: {education}
        - Skills: {skills_str}
        - Notable Achievement: {achievements}
        - Key Strength/Highlight: {highlight}

        The letter should be customized to the company and the role, and emphasize the candidate’s strengths relevant to cloud architecture and microservices. Only give the coverletter no other response. Start from Dear.
        """

        if not job_title or not company_name:
            return error_response(400, "Both job_title and company_name are required")
    
        session_id = event.get('sessionId', None)
        
        # https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-agent-runtime/client/retrieve_and_generate.html
        
        input_data = {
            'input': {
                'text': prompt  
            },
            'retrieveAndGenerateConfiguration': {
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId':knowledge_base_id ,
                    'modelArn': model_arn
                },
                'type': 'KNOWLEDGE_BASE'
            }
        }
        
        if session_id:
            input_data['sessionId'] = session_id
        
        print(input_data)
        
        response = client.retrieve_and_generate(**input_data)
        
        return response['output']


    except Exception as e:
        return error_response(500, f"An error occurred: {str(e)}")


        

        

def error_response(status_code, message):
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': message})
    }

