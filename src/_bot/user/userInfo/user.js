class User {
    constructor(userData) {
        this.rank = userData.rank;
        this.userName = userData.full_name;
        this.unit = userData.unit;
        this.phoneNumber = userData.phone_number;
        this.email = userData.email_address;
    }
}

export default User;