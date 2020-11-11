ver := $(shell tar -c --mtime='1970-01-01' --exclude='./k8s' ./bot | sha1sum | cut -b -6)
isDeployed := $(shell kubectl get deployment tgbot-money-checker)
ifneq ($(.SHELLSTATUS),0)
all: main deploy redeploy
else
all: main redeploy
endif

main: checkver build push
checkver:
	! kubectl get deployment tgbot-money-checker -o=jsonpath='{$$.spec.template.spec.containers[:1].image}' | grep $(ver)
build:
	docker build -t tgbot-money-checker .
	docker tag tgbot-money-checker registry.digitalocean.com/$(r)/tgbot-money-checker:$(ver)
push:
	docker push registry.digitalocean.com/$(r)/tgbot-money-checker:$(ver)
deploy:
	kubectl apply -f k8s/2.deployment.yaml
redeploy:
	kubectl set image deployment/tgbot-money-checker bot=registry.digitalocean.com/$(r)/tgbot-money-checker:$(ver) --record
