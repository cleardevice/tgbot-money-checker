ver := $(shell tar -c --mtime='1970-01-01' --exclude='./k8s' ./bot | sha1sum | cut -b -6)
isDeployed := $(shell kubectl get deployment tgbot-money-checker)
ifneq ($(.SHELLSTATUS),0)
all: main deploy
else
all: main redeploy
endif

main: checkver build push
checkver:
	! kubectl get deployment tgbot-money-checker -o=jsonpath='{$$.spec.template.spec.containers[:1].image}' | grep $(ver)
build:
	docker build -t tgbot-money-checker .
	docker tag tgbot-money-checker localhost:5000/tgbot-money-checker:$(ver)
push:
	ssh -f -L5000:localhost:5000 $(server) sleep 5
	docker push localhost:5000/tgbot-money-checker:$(ver)
deploy:
	sed -i 's/5000\/tgbot-money-checker.*$$/5000\/tgbot-money-checker:$(ver)/g' k8s/2.deployment.yaml
	kubectl apply -f k8s/2.deployment.yaml
	git checkout k8s/2.deployment.yaml
redeploy:
	kubectl set image deployment/tgbot-money-checker bot=localhost:5000/tgbot-money-checker:$(ver) --record
