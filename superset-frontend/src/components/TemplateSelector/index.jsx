/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, {useState, useEffect} from 'react';
import {styled, t} from '@superset-ui/core';
// import {Select} from 'src/components';
import {Input} from 'src/components/Input';
import {Select} from 'antd';

import Label from 'src/components/Label';
import {FormLabel} from 'src/components/Form';

const TemplateSelectorWrapper = styled.div`
  ${({theme}) => `
    .refresh {
      display: flex;
      align-items: center;
      width: 30px;
      margin-left: ${theme.gridUnit}px;
      margin-top: ${theme.gridUnit * 5}px;
    }

    .section {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .select {
      width: calc(100% - 30px - ${theme.gridUnit}px);
      flex: 1;
    }
    .input {
      width: calc(100% - 30px - ${theme.gridUnit}px);
      flex: 1;
    }

    & > div {
      margin-bottom: ${theme.gridUnit * 4}px;
    }
  `}
`;

const LabelStyle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: ${({theme}) => theme.gridUnit - 2}px;

  .backend {
    overflow: visible;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// const SelectLabel = ({ backend, templateName}) => (
//   <LabelStyle>
//     <Label className="backend">{backend}</Label>
//     <span className="name" title={templateName}>
//       {templateName}
//     </span>
//   </LabelStyle>
// );

export default function TemplateSelector() {

  const [templateOptions, setTemplateOptions] = useState([]);
  const [paramsList, setParamsList] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  //  mounted
  useEffect(() => {
    // 获取templates
    const templateOptions = [
      {
        id: 1,
        label: '项目各公司占比',
        paramsList: [
          {
            id: 0,
            label: '公司名称',
            name: 'company',
          },
        ],
      },
    ];
    // 赋值
    setTemplateOptions(templateOptions);
  }, []);
  // 监听currentTemplate
  useEffect(() => {
    if (currentTemplate) {
      setParamsList(currentTemplate.paramsList);
    }
  }, [currentTemplate]);

  // 触发template切换事件，然后这里要替换currenttemplate
  function changeTemplate(value) {
    // 切换currenttemplate
    setCurrentTemplate(value);
  }

  function renderSelectRow(select) {
    return (
      <div className="section">
        <span className="select">{select}</span>
      </div>
    );
  }

  function renderInputRow(input, label) {
    return (
      <div className="section">
        <span>{label}</span>
        <span className="input">{input}</span>
      </div>
    )
  }

  function renderTemplateSelect() {
    console.log('debugging', templateOptions, currentTemplate)
    const tempOptions = [
      {
        label: 'foo',
        value: 'bar'
      },
      {
        label: 'hello',
        value: 'world'
      }
    ]
    return (
      <Select
        placeholder={'Select template'}
        options={tempOptions}>
      </Select>)


    return (<Select>
      ariaLabel={t('Select template')}
      header={<FormLabel>{t('template')}</FormLabel>}
      name="select-template"
      placeholder={t('Select template')}
      labelInValue
      {/*onChange={changeTemplate}*/}
      showSearch
      options={tempOptions}
      value={tempOptions[0].value}
    </Select>)
    // return renderSelectRow(<Select></Select>)
    return renderSelectRow(
      <Select
        ariaLabel={t('Select template')}
        header={<FormLabel>{t('template')}</FormLabel>}
        labelInValue
        name="select-template"
        placeholder={t('Select template')}
        onChange={changeTemplate}
        options={templateOptions}
        showSearch
        value={currentTemplate}
      />
    );
  }

  function renderParamsInput(templateParams) {
    return renderInputRow(<Input/>, templateParams.name);
  }

  return (
    <TemplateSelectorWrapper data-test="DatabaseSelector">
      {renderTemplateSelect()}
      {/*{currentTemplate && paramsList.map(item => (renderParamsInput(item)))}*/}
    </TemplateSelectorWrapper>
  );
}
