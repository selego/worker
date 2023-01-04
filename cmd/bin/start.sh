NPMPATH=`npm config get prefix`

if [ -z "$1" ]
then
printf "Please type
- 'sw start' to run the worker locally,
- 'sw info' to get a visibility on what's going on
- 'sw deploy' %directory %nameofmachine %comment
- 'sw version'
- 'sw delete'"
 exit 1
fi

if [ $1 = "start" ]
then
echo "Run start"
node "$NPMPATH/lib/node_modules/selego-worker/src/index.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi

if [ $1 = "info" ]
then
echo "Run info"
node "$NPMPATH/lib/node_modules/selego-worker/src/info.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi

if [ $1 = "deploy" ]
then
echo "Run deploy"
node "$NPMPATH/lib/node_modules/selego-worker/src/deploy.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi

if [ $1 = "version" ]
then
echo "Run version"
node "$NPMPATH/lib/node_modules/selego-worker/src/version.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi

if [ $1 = "delete" ]
then
echo "Delete machine command"
node "$NPMPATH/lib/node_modules/selego-worker/src/delete.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi