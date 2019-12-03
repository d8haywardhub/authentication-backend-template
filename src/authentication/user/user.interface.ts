interface User {
    _id: string,
    name: string,
    email: string,
    password: string,
    address?: {
        street: string,
        city: string,
    }


    roles: string,
    
    disabled: boolean,


    resetRequired: boolean,

    _lastLogin: Date
}

export default User;