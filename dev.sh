#!/bin/sh
echo `date`+"compressing js..."
echo $1
terser themes/tomotoes/source/js/main.js --output themes/tomotoes/source/js/main.min.js --compress --mangle
hexo g
hexo s