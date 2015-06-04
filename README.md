# angular-mocke2e-maydelay
Enhance $httpBackend in ngMockE2E to support set a delay time for each http request-response mock, which may be helpful when testing webapp's waiting behavior without real backend, such as showing busy icon.
Inspired by the approach mentioned in this [`blog`](https://endlessindirection.wordpress.com/2013/05/18/angularjs-delay-response-from-httpbackend/).

## Install

```shell
bower install angular-mocke2e-maydelay
```
## Usage

Add a `<script>` to your `index.html`:

```html
<script src="/bower_components/angular-mocks/angular-mocks.js"></script>
<script src="/bower_components/angular-mocke2e-maydelay/angular-mocke2e-maydelay.js"></script>
```
Then add 'mayDelay' as a dependency of your app:

```javascript
angular.module('app', ['ngMockE2E', 'mayDelay'])
```

You can optionally specify a number as the last parameter of `respond` function which acts as the time to delay the response.  
```javascript
$httpBackend.whenGET('/foo.json').respond({foo:"bar"}, 3000); //delay 3s
$httpBackend.whenPOST('/bar',{foo:"bar"}).respond(200, "succeed", 5000); //delay 5s

```

## License
MIT