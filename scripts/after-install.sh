#!/bin/bash

env_file="/home/ubuntu/build/.env"
i=1
while IFS='=' read -r key value; do
  # key-value 형태의 한 줄에서 '=' 문자 이전의 모든 문자열(key)을 제거하여 value 값만 추출
  eval "var$i=\"$value\""
  i=$((i+1))
done < "$env_file"

cat > /home/ubuntu/build/ecosystem.config.json <<EOF
{
  "apps": [
    {
      "name": "app",
      "script": "./dist/main.js",
      "instances": 1,
      "instance_var": "APP_INSTANCE_SEQ",
      "exec_mode": "cluster",
      "listen_timeout": 1000,
      "restart_delay": 1000,
      "Cwd": ".",
      "env_production": {
                "PORT" : "$var1", 
                "SALT" : "$var2", 

                "DB_HOST" : "$var3", 
                "DB_PORT" : "$var4", 
                "DB_USERNAME" : "$var5", 
                "DB_PASSWORD" : "$var6", 
                "DB_DATABASE" : "$var7", 

                "JWT_ACCESS_EXPIRED_IN" : "$var8", 

                "NODE_ENV":"$var9"
      }
    }
  ]
}
EOF

cd /home/ubuntu/build

# npm ci 실행
sudo npm ci

# npm install이 성공적으로 실행되었는지 확인
if [ $? -eq 0 ]; then
  echo "npm install completed successfully"
  
  cd /home/ubuntu/build
  npm run start
  
else
  echo "npm install failed"
  exit 1 # 실패 시 스크립트 종료
fi