import type { ReactNode } from 'react';
import type { AxiosResponse } from 'axios';

declare namespace Common {
  type Status = 'Success' | 'Error' | 'Processing' | 'Warning' | 'Default';

  type FileType = 'image' | 'gif' | 'video' | 'audio' | 'imageAndVideo';

  interface MenuItem {
    name: string;
    path: string;
    icon?: string;
    component?: string;
    element?: any;
    children?: MenuItem[];
  }

  interface StringObject {
    [key: string]: string;
  }
  interface BoolObject {
    [key: string]: boolean;
  }

  interface AnyObject {
    [key: string]: any;
  }

  interface OptionItem {
    label: string;
    value: any;
    [key: string]: any;
  }

  interface ValueEnum {
    [key: string]: {
      text: ReactNode;
      status?: Status;
      color?: string;
    };
  }

  type RequestData = {
    data: any;
    code: string | number;
    error?: string | boolean;
    message?: string;
  };

  type PageResultData = {
    total?: number;
    records?: any[];
  };

  type PageResult = {
    result: PageResultData;
  };

  type PromiseAxios = (...v: any[]) => Promise<AxiosResponse<any, any>>;
  type PromiseFn<T = any[], U = any> = (...args: T) => Promise<U>;
  type DebounceAsyncFunction<T extends (...args: any[]) => Promise<any>> = {
    (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<ReturnType<T>>;
    cancel: () => void;
  };

  type IdParams = { id?: string | number };

  type voidFn = (...args: any[]) => void;

  type SizeType = 'large' | 'middle' | 'small';
  type AlignType = 'left' | 'right' | 'center';
  type VerticalAlignType = 'top' | 'middle' | 'bottom';
  type DirectionType = 'ltr' | 'rtl';
  type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

  type AuthProps = {
    authKey?: string;
    show?: boolean;
    children: React.ReactNode;
  };

  type AuthPathProps = {
    location: Location;
    children: any;
    menuLoading?: boolean;
  };
  type AuthItemProps = { authKey?: string; authPath?: string; show?: boolean };

  type AProps = {
    href?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

  type City = {
    city_id?: number;
    /** 城市名称(中文) */
    city_name_cn?: string;
    /** 城市名称(英文) */
    city_name_en?: string;
    /** 省份 ID */
    province_id?: number;
    label?: string;
    value?: string;
  };

  type Province = {
    /** 该省份下城市列表 */
    city_list?: City[];
    /** 省份 ID */
    province_id?: number;
    /** 省份名称(中文) */
    province_name_cn?: string;
    /** 省份名称(英文) */
    province_name_en?: string;
    label?: string;
    value?: string;
    children?: City[];
  };
}

export = Common;
export as namespace Common;
