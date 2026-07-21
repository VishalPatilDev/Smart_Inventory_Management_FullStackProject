import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";

export default function OAuthSuccess() {

    const navigate = useNavigate();

    useEffect(() => {

        const processOAuthLogin = async () => {

            const params = new URLSearchParams(window.location.search);

            const token = params.get("token");

            if (!token) {
                navigate("/login");
                return;
            }

            localStorage.setItem("token", token);

            try {

                const response = await getCurrentUser();

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data)
                );

                navigate("/");

            } catch (err) {

                console.error(err);

                localStorage.removeItem("token");

                navigate("/login");
            }

        };

        processOAuthLogin();

    }, [navigate]);

    return <h2>Signing in...</h2>;
}