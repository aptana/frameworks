#/bin/bash
LIST=`find . -name *.html`
for i in $LIST;
do tidy -q -e -m -asxml $i;
echo "Converted $i";
done
