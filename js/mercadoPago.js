window.MPAuthenticator = (function () {
    const publicKey = "<YOUR_PUBLIC_KEY>";
    const mp = new MercadoPago(publicKey);

    let authenticatorInstance = null;

    async function initializeAuthenticator(amount, payerEmail) {
        try {
            // Starts the authentication flow using the payer's email and amount
            authenticatorInstance = await mp.authenticator(amount, payerEmail);
            return authenticatorInstance;
        } catch (error) {
            console.error(error.message, "Error code:", error?.errorCode);
            throw error;
        }
    }

    async function getAuthorizationToken() {
        try {
            // Shows the authentication modal flow and returns the token
            const authorizationToken = await authenticatorInstance.show();
            return authorizationToken;
        } catch (error) {
            console.error(error.message, "Error code:", error?.errorCode);
            throw error;
        }
    }

    async function getAccountPaymentMethods(authorizationToken) {
        try {
            // Gets the payment methods available for the user
            const userPaymentMethods = await mp.getAccountPaymentMethods(authorizationToken);
            return userPaymentMethods;
        } catch (error) {
            console.error(error.message, "Error code:", error?.errorCode, "Details:", error?.details);
            throw error;
        }
    }

    async function getCardId(authorizationToken, selectedPaymentMethodToken) {
        try {
            // Gets the identification number from the selected payment method
            const { card_id } = await mp.getCardId(authorizationToken, selectedPaymentMethodToken);
            return card_id;
        } catch (error) {
            console.error(error.message, "Error code:", error?.errorCode, "Details:", error?.details);
            throw error;
        }
    }

    function createSecureField(cardData, cvvContainerId) {
        // Creates a secure fields to get the CVV from the selected payment method
        const field = mp.fields.create('securityCode', {
            placeholder: cardData.security_code_settings.placeholder || "CVV",
        });

        field.mount(cvvContainerId);
        field.update({ settings: cardData.security_code_settings });
        return field;
    }

    async function getCardToken(cardId) {
        try {
            // Generates a payment intention token for the selected payment method
            const { id: cardToken } = await mp.fields.createCardToken({ cardId });
            return cardToken;
        } catch (error) {
            console.error("Error while generating card token:", error);
            throw error;
        }
    }

    async function updatePaymentMethodToken(authorizationToken, selectedPaymentMethodToken, cardToken) {
        try {
            // Updates the card token (pseudotoken) for the selected payment method
            await mp.updatePseudotoken(authorizationToken, selectedPaymentMethodToken, cardToken);
        } catch (error) {
            throw error;
        }
    }

    return {
        mp: mp,
        initializeAuthenticator,
        getAuthorizationToken,
        getAccountPaymentMethods,
        createSecureField,
        getCardId,
        getCardToken,
        updatePaymentMethodToken
    };
})();
