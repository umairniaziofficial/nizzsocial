import z from "zod";

export const SignUpValidationSchema = z.object({
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters." }),
    username: z.string()
        .min(2, { message: "Username must be at least 2 characters." })
        .max(50, { message: "Username must not exceed 50 characters." }),
    email: z.string()
        .email({ message: "Please enter a valid email address." }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters." })
        .max(50, { message: "Password must not exceed 50 characters." }),
});


export const PostValidation =  z.object(
    {caption: z.string().min(5, { message: "Caption must be at least 5 characters." }).max(2200),
    file: z.custom<File[]>(),
    location: z.string().min(2).max(2200),
    tags: z.string().optional(),}
)