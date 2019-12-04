interface User {
    _id: string,
    name: string,
    email: string,
    password: string,
    role: string,
    disabled: boolean,
    resetRequired: boolean
}

export default User;