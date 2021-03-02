#!/bin/sh

if [ -n "$1" -a "$1" != " " ];
    then echo $1;
    echo "hexo deploying...";
    hexo clean && hexo d;
    git add .
    git commit -m "$1"
    git push
    exit 1;
fi
echo `date`+"compressing js..."
echo $1
terser themes/tomotoes/source/js/main.js --output themes/tomotoes/source/js/main.min.js --compress --mangle
hexo g
hexo s
