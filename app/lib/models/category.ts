import {Schema , model ,models} from "mongoose";

const categoryScheme = new Schema(
    {
        title : {type:'string' , required:true} , 
        user : {type: Schema.Types.ObjectId , ref:"User"}
    },{
        timestamps:true ,
    }
)

const Category = models.Category || model('Category' , categoryScheme)

export default Category;