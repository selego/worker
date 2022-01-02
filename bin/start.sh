if [ -z "$1" ]
then
echo "Please type sw start, sw info or sw deploy"
 exit 1
fi


if [ $1 = "start" ]
then
echo "Run start"
node "/usr/local/lib/node_modules/selego-worker/src/index.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi

if [ $1 = "info" ]
then
echo "Run info"
node "/usr/local/lib/node_modules/selego-worker/src/info.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi

if [ $1 = "deploy" ]
then
echo "Run deploy"
node "/usr/local/lib/node_modules/selego-worker/src/deploy.js" $2 $3 $4 $5 $6 $7 $8 $9
 exit 1
fi