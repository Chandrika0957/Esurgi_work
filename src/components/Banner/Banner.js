import React from 'react';
import { Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const Banner = styled('div')({
  backgroundImage: "url(./testbg2.jpg)",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const BannerContent = styled(Container)({
  height: 300,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 25,
  justifyContent: 'space-around',
});

const Tagline = styled('div')({
  height: '40%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
});

const BannerText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Montserrat',
  marginBottom: 15,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: 'darkgrey',
  textTransform: 'capitalize',
  fontSize: 20,
}));

const BannerComponent = () => {
  return (
    <Banner>
      <BannerContent>
        <Tagline>
          <BannerText variant="h2" sx={{ fontWeight: 'bold' }}>
            Biostabilizer Data
          </BannerText>
          <Subtitle variant="subtitle2">
            Access Biostabilizer Patient Information
          </Subtitle>
        </Tagline>
        {/*<Carousel/>*/}
      </BannerContent>
    </Banner>
  );
};

export default BannerComponent;
