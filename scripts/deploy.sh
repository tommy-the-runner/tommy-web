#!/usr/bin
ls ~/.ssh
ssh-keyscan ertrzyiks.me >> ~/.ssh/known_hosts
git remote add dokku dokku@ertrzyiks.me:tommy-web
git push dokku HEAD:master -f -v
