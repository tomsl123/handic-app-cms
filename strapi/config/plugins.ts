module.exports = ({ env }) => ({
    "users-permissions": {
        config: {
            register: {
                // put the name of your added fields here
                allowedFields: ["firstName", "lastName", "birthDate", "language", "disability_card", "accessibility_needs"],
            },
        },
    }
});