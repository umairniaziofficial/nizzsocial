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
