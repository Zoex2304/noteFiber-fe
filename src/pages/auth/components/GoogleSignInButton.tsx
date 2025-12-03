import { Button } from "@/components/shadui/button";

export function GoogleSignInButton() {
    return (
        <Button
            variant="outline"
            className="w-full h-12 gap-3 text-base font-normal text-gray-700 border-gray-300 hover:bg-gray-50"
            type="button"
            onClick={() => console.log("Google Sign In clicked")}
        >
            <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
            />
            Sign in with Google
        </Button>
    );
}
