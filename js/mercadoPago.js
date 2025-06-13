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

    async function getFastPaymentToken() {
        try {
            // Shows the authentication modal flow and returns the fast payment token
            const fastPaymentToken = await authenticatorInstance.show();
            return fastPaymentToken;
        } catch (error) {
            console.error(error.message, "Error code:", error?.errorCode);
            throw error;
        }
    }

    async function getAccountPaymentMethods(fastPaymentToken) {
        try {
            // Gets the payment methods available for the user
            const userPaymentMethods = await mp.getAccountPaymentMethods(fastPaymentToken);
            return userPaymentMethods;
        } catch (error) {
            console.error(error.message, "Error code:", error?.errorCode, "Details:", error?.details);
            throw error;
        }
    }

    async function getCardId(fastPaymentToken, selectedPaymentMethodToken) {
        try {
            // Gets the identification number from the selected payment method
            const { card_id } = await mp.getCardId(fastPaymentToken, selectedPaymentMethodToken);
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

    async function updatePaymentMethodToken(fastPaymentToken, selectedPaymentMethodToken, cardToken) {
        try {
            // Updates the card token (pseudotoken) for the selected payment method
            await mp.updatePseudotoken(fastPaymentToken, selectedPaymentMethodToken, cardToken);
        } catch (error) {
            throw error;
        }
    }

    return {
        mp: mp,
        initializeAuthenticator,
        getFastPaymentToken,
        getAccountPaymentMethods,
        createSecureField,
        getCardId,
        getCardToken,
        updatePaymentMethodToken
    };
})();
