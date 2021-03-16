const { CognitoIdentityServiceProvider } = require("aws-sdk");
const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
const USER_POOL_ID = "us-east-1_XBoyZgoR8";
const stripe = require("stripe")("sk_test_51IVQy6B0kq10fifm3S1lISQK6P5HuV1lyY4bAG8W7PJVu735KJJWOQ8lwNZoAXq7vmDP3gH1zyxkyJTWtUXQDmuc00vThrs7H8");

const getUserEmail = async (event) => {
    const params = {
        UserPoolId: USER_POOL_ID,
        Username: event.identity.claims.username
    };
    const user = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
    const { Value: email } = user.UserAttributes.find((attr) => {
        if (attr.Name === "email") {
        return attr.Value;
        }
    });
    return email;
};

/*
 * Get the total price of the order
 * Charge the customer
 */
exports.handler = async (event) => {
    try {
        const { id, cart, total, address, token } = event.arguments.input;
        const { username } = event.identity.claims;
        const email = await getUserEmail(event);

        await stripe.charges.create({
        amount: total * 100,
        currency: "usd",
        source: token,
        description: `Order ${new Date()} by ${username} with ${email} email`
        });
        return { id, cart, total, address, username, email };
    } catch (err) {
        throw new Error(err);
    }
};