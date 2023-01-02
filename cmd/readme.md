# How it works


## Files : 

- code/* : THe script to run. Should contain all stuff to be able to run npm run start

- status.json : Upload be each device to give their status. 
Format : date: new Date(), status, version: pjson.version, cpu, mem 

- config.json : Upload when you deploy a script. 
Format : date: new Date(), folder, name, from: os.hostname(). This file is saved locally a each X minutes, we check if the configuration file has changed. If yes, we install the new script

- worker.log : Logs of the worker.



## Notes :

The env with all credentials is in ~/.selego-worker/.env






