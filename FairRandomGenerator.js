import crypto from "crypto";

export class FairRandomGenerator {
    static generateSecretKey() {
        return crypto.randomBytes(32).toString("hex");
    }

    static generateHMAC(secretKey, message) {
        return crypto.createHmac("sha256", secretKey).update(message).digest("hex");
    }

    static verifyHMAC(secretKey, message, hmac) {
        return FairRandomGenerator.generateHMAC(secretKey, message) === hmac;
    }
}
