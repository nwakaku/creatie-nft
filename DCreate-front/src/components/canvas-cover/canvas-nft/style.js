import styled from 'styled-components';

export const NFTCoverWrapper = styled.div`
  width: 100%;
  padding-bottom: 10px;
  box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background-color: #fff;
  flex: 0 0 320px;

  .pixel-content {
    position: relative;
    width: 100%;
  }

  .pixel-wrapper {
    width: 100%;
    padding: 100% 0 0;
    position: relative;
    margin-bottom: 5px;
    border-radius: 10px 10px 0 0;
    overflow-x: clip;
    overflow-y: clip;
  }

  &:hover {
    cursor: pointer;
    transform: translateY(-4px);
    box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.2);
  }
  @media screen and (max-width: 1152px) {
    flex: 0 0 ${(props) => props.width};
  }
  .ant-skeleton-element {
    width: 100%;
  }
`;

export const WalletNFTDetailWrapper = styled.div`
  margin: 0px 20px;
  .info-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nft-index {
    font-size: 16px;
    font-family: Poppins-SemiBold, Poppins;
    font-weight: 600;
    color: #000000;
    line-height: 26px;
  }

  .right-info {
    font-size: 14px;
    font-family: Poppins-Regular, Poppins;
    font-weight: 400;
    color: #6d7278;
    line-height: 23px;
    text-align: right;
  }

  .operation {
    width: fit-content;
    margin: 10px auto 0;
  }

  .sell-button {
    width: 79px;
    height: 30px;
    background: #4338ca;
    border-radius: 15px;
    font-size: 14px;
    font-family: PingFangTC-Semibold, PingFangTC;
    font-weight: 600;
    color: #ffffff;
    line-height: 20px;
    &:hover {
      color: #ffffff !important;
    }
  }
  .buy-button {
    width: 100px;
    height: 30px;
    background: #4338ca;
    border-radius: 15px;
    border: none;
    font-size: 14px;
    font-family: PingFangTC-Semibold, PingFangTC;
    font-weight: 600;
    color: #ffffff;
    line-height: 20px;
    &:hover {
      color: #ffffff !important;
    }
  }
`;

export const MarketNFTDetailWrapper = styled.div`
  margin: 0px 20px;
  .detail {
    width: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nft-index {
    font-size: 16px;
    font-family: Poppins-SemiBold, Poppins;
    font-weight: 600;
    color: #000000;
    line-height: 26px;
  }

  .canvas-worth {
    font-size: 16px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 22px;
  }

  .canvas-price {
    display: flex;
    justify-content: flex-end;
  }
`;

export const MultiCanvasDoneWrapper = styled.div`
  flex: 1;
  margin: 0px 20px;
  .canvas-index {
    span {
      display: inline-block;
      &:nth-child(1) {
        font-size: 16px;
        font-family: Poppins-SemiBold, Poppins;
        font-weight: 600;
        color: #000000;
        line-height: 26px;
      }
    }
  }
  .content {
    margin: 5px 0;
    span {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #999999;
      line-height: 14px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      label {
        display: inline-block;
      }
    }
  }
  .invested {
    text-align: end;
    font-size: 14px;
    color: #999999;
  }
  .canvas-edit {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
`;
