import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      navigate("/");
    };
  }, []);

  return (
    <Card className="w-full h-full overflow-hidden">
      <div className="flex flex-col items-center justify-center w-full h-full">
        404 Not Found
      </div>
    </Card>
  );
}
