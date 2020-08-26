# Ticketing App


## Deployment

### Dev Environment Setup
#### Host file entry
Add the website domain name "ticketing.dev" in the /etc/hosts mapped to 127.0.0.1
```
127.0.0.1 ticketing.dev
```

#### Skaffold
```
brew install skaffold
```

Starting the cluster
```
skaffold dev
```

Stopping the cluster
```
CTRL+C
```


### Ingress Controllers 
Ingress controllers are used for load balancing and routing / traffic shaping

https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac

The current implementation of nginx ingress controller does not support http verb based routing and is not suitable for REST based implementation. Consider implementing the following alternatives

#### Nginx Ingress
https://docs.nginx.com/nginx-ingress-controller/configuration/virtualserver-and-virtualserverroute-resources/


#### Traefik
https://medium.com/kubernetes-tutorials/deploying-traefik-as-ingress-controller-for-your-kubernetes-cluster-b03a0672ae0c