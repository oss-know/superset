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
import React, { useState, useEffect } from 'react';
import { styled, t, SupersetClient } from '@superset-ui/core';
import { Select } from 'src/components';
import { Input } from 'src/components/Input';
import Button from 'src/components/Button';
import { FormLabel } from 'src/components/Form';

const TemplateSelectorWrapper = styled.div`
  ${({ theme }) => `    
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

export default function TemplateSelector() {
  const [templatesInfo, setTemplatesInfo] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [paramsList, setParamsList] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [payload, setPayload] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  // function getTemplate() {
  //   SupersetClient.get({ endpoint: `/api/v1/database/getTemplateList` })
  //     .then(({ json }) => {
  //       const templatesInfo = json.template_list
  //       setTemplatesInfo(templatesInfo);
  //       // 将模板转成selector需要的格式
  //       const templateOptions = templatesInfo.map(item => ({
  //         label: item.label,
  //         value: item.id,
  //       }));
  //       setTemplateOptions(templateOptions);
  //     })
  //     .catch(() => {});
  // }

  useEffect(() => {
    // 这里向后台发送请求,获取模板列表
    // getTemplate();
    const templatesInfo = [
      {
        id: 0,
        label: '项目各公司占比',
        name: 'company_ratio',
        paramsList: [
          {
            name: 'org',
            description: '',
          },
        ],
      },
      {
        id: 1,
        label: '项目时区占比',
        name: 'timezone_ratio',
        paramsList: [
          {
            name: 'org',
            description: '',
          },
          {
            name: 'email',
            description: 'aa',
          },
        ],
      },
    ];
    setTemplatesInfo(templatesInfo);
    // 将模板转成selector需要的格式

    const templateOptions = templatesInfo.map(item => ({
      label: item.label,
      value: item.id,
    }));
    setTemplateOptions(templateOptions);
  }, []);

  useEffect(() => {
    if (currentTemplate) {
      setParamsList(templatesInfo[currentTemplate.value].paramsList);
      const payload = {};
      paramsList.forEach(item => {
        payload[item.name] = null;
      });
      setPayload(payload);
    } else {
      setPayload({});
    }
  }, [currentTemplate, templatesInfo, paramsList]);

  function changeTemplate(template) {
    if (template) {
      setCurrentTemplate(template);
    }
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
      <>
        <FormLabel>{label}</FormLabel>
        <div className="section">
          <span className="input">{input}</span>
        </div>
      </>
    );
  }

  function renderTemplateSelect() {
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
      />,
    );
  }
  function changeParam(e) {
    if (e.target && e.target.id) {
      const currentPayload = payload;
      currentPayload[e.target.id] = e.target.value;
      setPayload(currentPayload);
    }
  }
  function renderParamsInput(templateParam) {
    return renderInputRow(
      <Input
        placeholder={templateParam.description}
        key={`${currentTemplate.value}_${templateParam.name}`}
        onChange={changeParam}
        id={templateParam.name}
      />,
      templateParam.name,
    );
  }

  function postTemplateParamsData(payload) {
    return SupersetClient.post({
      endpoint: encodeURI('/api/create_dataset'),
      postPayload: payload,
    })
      .then(({ json }) => {
        setButtonLoading(false);
        const { dataset_id: datasetId } = json;
        window.open(
          `/explore/?datasource_id=${datasetId}&datasource_type=query`,
          '_blank',
          'noreferrer',
        );
      })
      .catch(err => {
        // 这里应该改成错误提示信息,
        console.log(err);
      });
  }

  function onClick() {
    setButtonLoading(true);
    postTemplateParamsData(payload);
  }
  return (
    <>
      <TemplateSelectorWrapper>
        {renderTemplateSelect()}
        {currentTemplate && paramsList.map(item => renderParamsInput(item))}
      </TemplateSelectorWrapper>
      <Button
        block
        buttonSize="large"
        disabled={buttonLoading}
        loading={buttonLoading}
        onClick={onClick}
      >
        RUN
      </Button>
    </>
  );
}
