import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import File from "./File";
import { useTheme } from "@emotion/react";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Versions() {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Item One" {...a11yProps(0)} />
          <Tab label="Item Two" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        {/* the file comp */}
        <File />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {/* the version comp */}
        <File />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={0}>
        {/* the file comp */}
        <File />
      </CustomTabPanel>{" "}
      <CustomTabPanel value={value} index={0}>
        {/* the file comp */}
        <File />
      </CustomTabPanel>
    </Box>
  );
}
