ver := $(shell tar -c --mtime='1970-01-01' --exclude='./k8s' ./bot | sha1sum | cut -b -6)

all: checkver build push redeploy
checkver:
	! grep $(ver) k8s/2.deployment.yaml
build:
	docker build -t tgbot-money-checker .
	docker tag tgbot-money-checker localhost:5000/tgbot-money-checker:$(ver)
push:
	ssh -f -L5000:localhost:5000 $(server) sleep 5
	docker push localhost:5000/tgbot-money-checker:$(ver)
redeploy:
	sed -i 's/5000\/tgbot-money-checker.*$$/5000\/tgbot-money-checker:$(ver)/g' k8s/2.deployment.yaml
	kubectl set image deployment/tgbot-money-checker bot=localhost:5000/tgbot-money-checker:$(ver) --record
