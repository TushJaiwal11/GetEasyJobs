import { dividerClasses } from "@mui/material";

let navigate = null;

export const setNavigate = (navFn) => {
    navigate = navFn;
};
dividerClasses
export const getNavigate = () => navigate;
