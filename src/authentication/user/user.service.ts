import User from '../user/user.interface';
import UserModel from './../user/user.model';

class UserService {

    public user:UserModel = new UserModel();

    constructor() { }

    public getUser = async (email: string): Promise<User> => {
        debugger;
        return this.user.userModel.findOne({"email": email})
    }

    public getUserCount = async (email: string): Promise<number> => {
        return this.user.userModel.count({"email": email})
    }

    public getDocumentCount = async (): Promise<number> => {
        return this.user.userModel.count({});
    }

    public createUser = async (userData: any): Promise<User> => {
        const newUser:User = userData;
        return this.user.userModel.create(newUser);
    }
}
const userService = new UserService();

//export default UserService;
export default userService;