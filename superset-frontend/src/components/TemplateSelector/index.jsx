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
import { styled, t } from '@superset-ui/core';
import { Select } from 'src/components';
import { Input } from 'src/components/Input';
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

  useEffect(() => {
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
          {
            name: 'email',
            description: 'a',
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

    const templateOptions = templatesInfo.map(item => ({
      label: item.label,
      value: item.id,
    }));
    setTemplateOptions(templateOptions);
  }, []);

  useEffect(() => {
    if (currentTemplate) {
      setParamsList(templatesInfo[currentTemplate.value].paramsList);
    }
  }, [currentTemplate, templatesInfo]);

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
          <span className="refresh"> </span>
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

  function renderParamsInput(templateParam) {
    return renderInputRow(
      <Input placeholder={templateParam.description} />,
      templateParam.name,
    );
  }

  return (
    <TemplateSelectorWrapper data-test="DatabaseSelector">
      {renderTemplateSelect()}
      {currentTemplate && paramsList.map(item => renderParamsInput(item))}
    </TemplateSelectorWrapper>
  );
}
