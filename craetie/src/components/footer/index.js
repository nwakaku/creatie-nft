import React, { useState, useEffect } from 'react';
import './style.less';
import ContactEmail from '@/assets/images/icon/email.svg';
import ContactDiscord from '@/assets/images/icon/discord.svg';
import Medium from '@/assets/images/footer/medium.png';
import GitHub from '@/assets/images/footer/github.png';
import Twitter from '@/assets/images/footer/twitter.png';
import Discord from '@/assets/images/footer/discord.png';
import Youtube from '@/assets/images/footer/youtube.png';
import Logo from '@/assets/images/logo_word.svg';

const Footer = React.memo((props) => {
  const [link] = useState([
    { icon: Twitter, url: '' },
    { icon: Medium, url: '' },
    { icon: GitHub, url: '' },
    { icon: Discord, url: '' },
    { icon: Youtube, url: '' },
  ]);

  useEffect(() => {}, []);
  return (
    <div className="footer-wrapper">
      <div className="content-left">
        <img alt="" className="title" src={Logo}></img>
        <p>Dcreate is a Decentralized creation platform. It allows anyone to create, design, customize and trade artworks on-chain.</p>
        <div className="list">
          {link.map((item, index) => {
            return (
              <a href={item.url} target="_blank" rel="noopener noreferrer" key={index}>
                <img alt="" src={item.icon} />
              </a>
            );
          })}
        </div>
      </div>
      <div className="content-right"></div>
    </div>
  );
  // return (
  //   <FooterWrapper bg={footerBg} bg1={footerBg1} bg2={footerBg2}>
  //     <div className="content">
  //       <div className="form-wrapper">
  //         <h3>Join our newsletter</h3>
  //         <div className="flex-0">
  //           <Input type="text" placeholder="Your email address" onChange={handleOnChange} />
  //           <Button type="default" htmlType="submit" loading={loading}>
  //             Subscribe
  //           </Button>
  //         </div>
  //       </div>
  //       <div className="list">
  //         {link.map((item, index) => {
  //           return (
  //             <a href={item.url} target="_blank" rel="noopener noreferrer" key={index}>
  //               <img alt=""src={item.icon} />
  //             </a>
  //           )
  //         })}
  //       </div>
  //     </div>
  //   </FooterWrapper>
  // )
});

export default Footer;
