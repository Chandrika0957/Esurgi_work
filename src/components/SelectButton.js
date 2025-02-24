import React from 'react';
import { styled } from '@mui/material';

const StyledSelectButton = styled('span')(({ theme, selected }) => ({
  border: "1px solid rgb(0,113,115)",
  borderRadius: 5,
  padding: '10px 20px',
  fontFamily: "Montserrat",
  cursor: "pointer",
  backgroundColor: selected ? "rgb(0,113,115)" : "",
  color: selected ? "black" : "",
  fontWeight: selected ? 700 : 500,
  "&:hover": {
    backgroundColor: "rgb(0,113,115)",
    color: "black",
  },
  width: "22%",
}));

const SelectButton = ({ children, selected, onClick }) => {
  return (
    <StyledSelectButton
      onClick={onClick}
      selected={selected}
    >
      {children}
    </StyledSelectButton>
  );
};

export default SelectButton;
