import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type {Settings as LayoutSettings} from '@ant-design/pro-components';
import {PageLoading, SettingDrawer} from '@ant-design/pro-components';
import type {RunTimeLayoutConfig} from 'umi';
import {history} from 'umi';
import {ConfigProvider} from 'antd';
import defaultSettings from '../config/defaultSettings';

const loginPath = '/user/login';

ConfigProvider.config({
  theme: {
    primaryColor: '#7cd6cf',
  }
});

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading/>,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: string | null;
  loading?: boolean;
  fetchUserInfo?: () => Promise<string | null>;
}> {
  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (token !== "") {
      return token;
    }
    else {
      history.push(loginPath);
    }
    return "";
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({initialState, setInitialState}) => {
  return {
    rightContentRender: () => <RightContent/>,
    disableContentMargin: false,
    waterMarkProps: false,
    // content: initialState?.currentUser?.name,
    // },
    footerRender: () => <Footer/>,
    onPageChange: () => {
      const {location} = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children: any, props: { location: { pathname: string | string[]; }; }) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/user/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};
