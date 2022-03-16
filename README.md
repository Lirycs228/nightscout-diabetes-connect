# Nightscout Diabetes Connect Uploader/Sidecar
Simple Script written in JavaScript (Node) that uploads entries from Diabetes Connect to Nightscout. The upload happens every 5 minutes.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/lirycs228/nightscout-diabetes-connect)

## Configuration
The script takes the following environment variables

|Variable| Description                                                                                             | Example                                  |Required|
|---|---------------------------------------------------------------------------------------------------------|------------------------------------------|---|
|DIABETES_CONNECT_USERNAME| Diabetes Connect Login Email                                                                                | mail@example.com                         |X|
|DIABETES_CONNECT_PASSWORD| Diabetes Connect Login Password                                                                             | mypassword                               |X|
|NIGHTSCOUT_URL| Hostname of the Nightscout instance (without https://)                                                  | nightscout.yourdomain.com                |X|
|NIGHTSCOUT_API_TOKEN| Nightscout access token                                                                    | diabetesco-abc123def456ghi7 |X|


Keep in mind that the script currently only uses values in mg/dl and assumes a x5 factor from diabetes connect meals to nightscout carbs

## Usage
There are different options for using this script.

### Variant 1: On Heroku

- Click [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/lirycs228/nightscout-diabetes-connect)
- Login to Heroku if not already happened
- Provide proper values for the `environment variables`
- Click `Deploy` to deploy the app

### Variant 2: Local

The installation process can be startetd by running `npm install` in the root directory.

To start the process simply create a bash script with the set environment variables (`start.sh`):

```
#!/bin/bash
export DIABETES_CONNECT_USERNAME="mail@example.com"
export DIABETES_CONNECT_PASSWORD="mypassword"
export NIGHTSCOUT_URL="nightscout.yourdomain.com"
export NIGHTSCOUT_API_TOKEN=diabetesco-abc123def456ghi7

npm start
```

Execute the script and check the console output.

### Variant 3: Docker
The easiest way to use this is to use the latest docker image:

```
docker run -e DIABETES_CONNECT_USERNAME="mail@example.com" \
            -e DIABETES_CONNECT_PASSWORD="mypassword" \
            -e NIGHTSCOUT_URL="nightscout.yourdomain.com" \
            -e NIGHTSCOUT_API_TOKEN="diabetesco-abc123def456ghi7" ghcr.io/lirycs228/nightscout-diabetes-connect
```

### Variant 4: Docker Compose
If you are already using a dockerized Nightscout instance, this image can be easily added to your existing docker-compose file:

```
version: '3.7'

services:
  nightscout-diabetes-connect:
    image: ghcr.io/lirycs228/nightscout-diabetes-connect
    container_name: nightscout-diabetes-connect
    environment:
      DIABETES_CONNECT_USERNAME: "mail@example.com"
      DIABETES_CONNECT_PASSWORD: "mypassword"
      NIGHTSCOUT_URL: "nightscout.yourdomain.com"
      NIGHTSCOUT_API_TOKEN: "diabetesco-abc123def456ghi7"
```
