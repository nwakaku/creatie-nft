import { memo } from 'react';
import Footer from '@/components/footer';
import Content from './Content';
import './style.less';
import { Layout } from 'antd';
function Home() {
  return (
    <Layout
      style={{
        minHeight: '100%',
        background: 'transparent',
      }}
    >
      <Content />
      {/* <Layout.Content>
          <HomeBanner />
          <MultiCanvasPage>
            <MultiList />
          </MultiCanvasPage>
        </Layout.Content> */}
      <Layout.Footer
        style={{
          padding: 0,
        }}
      >
        <Footer />
      </Layout.Footer>
    </Layout>
  );
}

export default memo(Home);
