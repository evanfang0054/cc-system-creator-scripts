/**
 * TrackView 组件常用使用模式模板
 * 基于实际demo和文档编写
 */

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { TrackView } from '@dragonpass/intl-unified-tracker';
import { Button, Dialog, Popup, Space } from 'antd-mobile'; // 基于实际demo使用的组件库

// ==================== 基础使用模板（基于实际demo） ====================

/**
 * 1. 基础点击埋点（基于实际demo）
 */
export const BasicClickTemplate: React.FC = () => {
  const handleClick = () => {
    // 基于实际demo的API调用方式
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'demo',
        component_name: 'click',
        // TODO: 如需添加额外字段，请在此处添加并确保符合神策数据规范
        // 示例：action_type: 'primary_click' 需要神策团队确认
      },
    });
  };

  return (
    <Button color="primary" onClick={handleClick}>
      click
    </Button>
  );
};

/**
 * 2. 基础曝光埋点（基于实际demo）
 */
export const BasicExposureTemplate: React.FC = () => {
  return (
    <TrackView
      trackData={{
        module_name: 'demo',
        component_name: 'demo_div',
        // TODO: 如需添加额外属性，请确保符合神策数据规范
        // 示例：content_type: 'banner' 需要神策团队确认字段定义
      }}
      trackClk={false}  // 基于实际demo配置
      component="div"
      id="demo-lagyout"
    >
      <Space
        wrap
        style={{
          width: '100%',
        }}
      >
        <div>这个div会在进入视口时触发曝光埋点</div>
      </Space>
    </TrackView>
  );
};

// ==================== 完整Demo模板（基于实际demo.tsx） ====================

/**
 * 3. 完整Demo组件（基于实际demo.tsx）
 */
export const DemoTrackerTemplate: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleClick = () => {
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'demo',
        component_name: 'click',
      },
    });
  };

  const handleLogin = () => {
    window.dpTracker?.identify({
      user_id: 'test_user_id',
      DPID: 'test_DPID',
      app_name: 'test_app_name',
      app_version: '0.0.1',
    });
  };

  const handlePageViewTest = () => {
    window.dpTracker?.sendPage({
      publicParams: {
        page_name: '测试页面',
      },
    });
  };

  useEffect(() => {
    window.dpTracker?.sendPage({
      publicParams: {
        page_name: 'spmB1',
      },
    });

    return () => {
      window.dpTracker?.sendPageEnd();
    };
  }, []);

  return (
    <TrackView
      trackData={{
        module_name: 'demo',
        component_name: 'demo_div',
      }}
      trackClk={false}
      component="div"
      id="demo-lagyout"
    >
      <Space
        wrap
        style={{
          width: '100%',
        }}
      >
        <Button color="primary" onClick={handleClick}>
          click
        </Button>
        <Button color="primary" onClick={handleLogin}>
          登录或者免登
        </Button>
        <Button color="primary" onClick={handlePageViewTest}>
          pageView
        </Button>
        <Button color="primary" onClick={() => setModalVisible(true)}>
          NoDestoryModal
        </Button>
      </Space>
      <DemoPopup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </TrackView>
  );
};

/**
 * DemoPopup组件（基于实际demo）
 */
function DemoPopup(props: { visible: boolean; onClose(): void }) {
  return (
    <Popup
      showCloseButton
      visible={props.visible}
      onClose={() => props.onClose()}
    >
      <TrackView
        trackData={{
          module_name: 'demo_popup',
          component_name: 'demo_popup_body',
        }}
        trackClk={false}
      >
        <div>content.....</div>
        <div>content.....</div>
        <div>content.....</div>
        <div>content.....</div>
        <div>content.....</div>
        <div>content.....</div>
      </TrackView>
    </Popup>
  );
}

// ==================== 列表渲染模板（基于实际文档） ====================

/**
 * 4. 列表遍历埋点模板（基于实际文档）
 */
export const ListTraversalTemplate: React.FC = () => {
  // 基于实际文档中的示例，需要自定义CustomItem组件
  const CustomItem = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
    ({ className, children }, ref) => {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }
  );

  return (
    <div>
      {/* 基于实际文档中的列表遍历示例 */}
      {Array.from({ length: 10 }).map((_, idx) => {
        const className = `item-${idx}`;
        return (
          <TrackView
            key={idx}
            component={CustomItem}
            className={className}
            trackData={{ module_name: 'list', component_name: `item-${idx}` }}
            findRootNode={() => document.querySelector(`.${className}`)}
          >
            Item {idx}
          </TrackView>
        );
      })}
    </div>
  );
};

// ==================== 弹窗和对话框模板（基于实际demo） ====================

/**
 * 5. Dialog埋点模板（基于实际demo）
 */
export const DialogTemplate: React.FC = () => {
  const showDialog = () => {
    Dialog.show({
      title: '权益激活',
      content: (
        <TrackView
          component="div"
          trackClk={false}
          trackData={{
            module_name: 'demo_dialog',
            component_name: 'body',
          }}
        >
          <div>
            <div>权益过期时间：2023-01-01</div>
          </div>
        </TrackView>
      ),
      getContainer: () => document.getElementById('demo-lagyout'), // 基于实际demo
      actions: [
        [
          {
            key: 'cancel',
            text: '取消',
            onClick: () => {
              window.dpTracker?.sendClk({
                eventData: {
                  module_name: 'demo_dialog',
                  coponent_name: '关闭按钮', // 注意实际demo中的拼写
                },
              });
              Dialog.clear();
            },
            style: {
              color: '#202020',
              fontSize: 15,
            },
          },
          {
            key: 'delete',
            text: '确定激活',
            style: { fontSize: 15 },
            onClick: () => {
              window.dpTracker?.sendClk({
                eventData: {
                  module_name: 'demo_dialog',
                  coponent_name: '确认激活',
                },
              });
              Dialog.clear();
            },
          },
        ],
      ],
    });
  };

  return (
    <TrackView
      trackData={{
        module_name: 'demo',
        component_name: 'demo_div',
      }}
      trackClk={false}
      component="div"
      id="demo-lagyout"
    >
      <Button color="primary" onClick={showDialog}>
        Dialog.show
      </Button>
    </TrackView>
  );
};

// ==================== 嵌套组件模板（基于实际文档） ====================

/**
 * 6. 嵌套组件埋点模板（基于实际文档）
 */
export const NestedComponentTemplate: React.FC = () => {
  const handleOuterClick = () => {
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'Modal',
        component_name: 'Container',
      },
    });
  };

  const handleInnerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡

    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'Modal',
        component_name: 'ConfirmButton',
      },
    });
  };

  return (
    <TrackView
      trackData={{ module_name: 'Modal', component_name: 'Container' }}
      onClick={handleOuterClick}
    >
      <div style={{ padding: 20, border: '1px solid #ccc' }}>
        <h3>外层容器</h3>
        <p>点击这里会触发外层埋点</p>

        <TrackView
          trackData={{ module_name: 'Modal', component_name: 'ConfirmButton' }}
          trackExp={false} // 内层不跟踪曝光
          onClick={handleInnerClick}
        >
          <Button
            color="primary"
            style={{ marginTop: 16 }}
          >
            Confirm (阻止冒泡)
          </Button>
        </TrackView>
      </div>
    </TrackView>
  );
};

// ==================== 自定义组件模板（基于实际文档） ====================

/**
 * 7. 不支持 forwardRef 的自定义组件埋点
 */
const CustomCardWithoutRef: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => {
  return (
    <div className={className} style={{ border: '1px solid #d9d9d9', padding: 16, borderRadius: 6 }}>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export const CustomComponentTemplate: React.FC = () => {
  const handleCardClick = () => {
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'custom_component',
        component_name: 'custom_card',
        card_title: '自定义卡片',
      },
    });
  };

  // 为自定义组件生成唯一类名
  const getUniqueClassName = () => {
    return `custom-card-${Date.now()}`;
  };

  const uniqueClassName = getUniqueClassName();

  return (
    <TrackView
      component={CustomCardWithoutRef}
      trackData={{
        module_name: 'custom_component',
        component_name: 'custom_card',
        card_title: '自定义卡片',
      }}
      className={uniqueClassName}
      findRootNode={() => document.querySelector(`.${uniqueClassName}`)}
      title="自定义卡片示例"
      onClick={handleCardClick}
    >
      <p>这是一个不支持 forwardRef 的自定义组件</p>
      <p>使用 findRootNode 来获取真实 DOM 进行埋点</p>
    </TrackView>
  );
};

// ==================== 导出所有模板 ====================

export const TrackViewTemplates = {
  BasicClickTemplate,
  BasicExposureTemplate,
  DemoTrackerTemplate,
  ListTraversalTemplate,
  DialogTemplate,
  NestedComponentTemplate,
  CustomComponentTemplate,
};