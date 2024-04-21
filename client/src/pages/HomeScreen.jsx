import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ResponsiveAppBar from "../components/Appbar";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { CardMedia } from "@mui/material";

export default function HomeScreen({ onLogout }) {
  const [graphs, setgraphs] = useState([{ name: "" }]);

  const getAllPairs = async () => {
    const token = localStorage.getItem("token");
    const user = jwtDecode(token);
    console.log({ user });
    try {
      const response = await axios.get(
        `http://localhost:5000/pair/get/${user.userId}`,

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setgraphs(response.data);
    } catch (error) {
      console.error("Error logging in:", error.response.data.message);
    }
  };

  useEffect(() => {
    getAllPairs();
  }, []);

  return (
    <>
      <ResponsiveAppBar onLogout={onLogout} />
      <div style={{ padding: 16 }}>
        <Grid container spacing={2}>
          {graphs?.map((card) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={card.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="150"
                  image="https://web.cecs.pdx.edu/~sheard/course/Cs163/Graphics/graph4.png"
                  alt="green iguana"
                  style={{ objectFit: "contain" }}
                />
                <CardContent style={{ textAlign: "center" }}>
                  <Typography variant="body2" component="p">
                    {card.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
}
