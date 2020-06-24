---
title:  "Braintree Integration on Laravel"
subtitle: "A payment gateway now made even simpler to use"
date:   2014-12-22
categories: ["coding", "php", "laravel", "payment gateway"]
tags: ["payment", "braintree", "laravel", "php", "gateway"]
image: "braintree.jpg"

---
### A payment gateway now made even simpler to use

[Braintree][braintreesite] is one of the easiest payment gateways that I've encountered and one of the trickiest to setup. Now, that I feel quite comfortable with the setup, here's a got through towards a basic setup for your own app. I used laravel at the time, so I'll be telling how to setup braintree in laravel, but it's pretty much similar for other frameworks and languages too.


#### Steps to Setup Braintree for your project

  * Signup an  account credentials with [braintree website][braintreesite]. Braintree offers a free sandbox account in which you can do as much testing as you want, which is really cool.

  * Next you will be directed to your dashboard where you can your keys, public key, private key, merchant ID, etc. We'll come to these later.

  * Now go back to your laravel project and add the following to your composer.json file:

    {% codeblock lang:json %}
    "require": {
      "braintree/braintree_php" : "2.33.0"
    }
    {% endcodeblock %}

    Or whatever version is latest at the time.

  * And run a composer update from your terminal:
    {% codeblock lang:bash %}
    composer update
    {% endcodeblock %}

  * Now, include the key file that you got of your sandbox account in the config files. You can create a local folder of your app.php and put all of them in there:
    {% codeblock lang:php %}
      'braintree_environment' => '',
      'braintree_merchantid' => '',
      'braintree_public_key' => '',
      'braintree_private_key' => ''
    {% endcodeblock %}

  * Now, you are all set to start with braintree. Now open up your controller and write the following to create a client token, which you will need to setup the payment form:
    {% codeblock lang:php %}
    $clientToken = Braintree_ClientToken::generate();
    {% endcodeblock %}

    And in the client-side you will need to include this with something like this:
    {% codeblock lang:php %}
    braintree.setup("CLIENT-TOKEN-FROM-SERVER", "custom", {id: "checkout"});
    {% endcodeblock %}

  * Next, you will need to setup your client-side, i.e. the payment form part. To do that, open up your view file and put in something like this(Of course only the fields that you require. This is only a minimalist example of what you can do with it):
    {% codeblock lang:html %}
    <form id="checkout" action="/your/server/endpoint" method="post">
      <input data-braintree-name="number" value="4111111111111111">
      <input data-braintree-name="cvv" value="100">

      <input data-braintree-name="expiration_date" value="10/20">

      <!-- you can also split expiration date into two fields -->
      <input data-braintree-name="expiration_month" value="10">
      <input data-braintree-name="expiration_year" value="2020">

      <input data-braintree-name="postal_code" value="94107">
      <input data-braintree-name="cardholder_name" value="John Smith">

      <input type="submit" id="submit" value="Pay">
    </form>
    {% endcodeblock %}

  And the scipt to follow up:

  {% codeblock lang:js %}
    client.tokenizeCard({
      number: "4111111111111111",
      cardholderName: "John Smith",
      // You can use either expirationDate
      expirationDate: "10/20",
      // or expirationMonth and expirationYear
      expirationMonth: "10",
      expirationYear: "2015",
      // CVV if required
      cvv: "832",
      // Address if AVS is on
      billingAddress: {
        postalCode: "94107"
      }
    }, function (err, nonce) {
      // Send nonce to your server
    });
  {% endcodeblock %}

  * Now, when you sent the request to braintree with these data, braintree replies with a payment nounce which you can use to charge the customer. You can do something like this:
    {% codeblock lang:php %}
      $result = Braintree_Transaction::sale(array(
          'amount' => 10,
          'paymentMethodNonce' => $nounce
        ));
    {% endcodeblock %}


Now, that's all that's needed to complete a full payment gateway.


Simple enough. Isn't it? Go ahead! Try it out yourself.




[braintreesite]: https://www.braintreepayments.com/
