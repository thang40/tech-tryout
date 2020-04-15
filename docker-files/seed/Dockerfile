FROM mongo

COPY seed.json /seed.json
CMD mongoimport --host mongodb --db alpr --collection plates --type json --drop --file /seed.json --jsonArray
