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
import RefreshLabel from 'src/components/RefreshLabel';
import MultipleInput from 'src/components/MultipleInput';
import { Input } from 'src/components/Input';
import { FormLabel } from 'src/components/Form';

const TemplateSelectorWrapper = styled.div`
  ${({ theme }) => `    
    .add-label, .refresh {
      display: flex;
      align-items: center;
      width: 30px;
      margin-left: ${theme.gridUnit}px;
      margin-top: ${theme.gridUnit * 5}px;
    }
    .add-label{
      transform: translateY(${theme.gridUnit * 5}px);
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

export default function TemplateSelector(props) {
  const [templatesInfo, setTemplatesInfo] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [params, setParams] = useState(null);

  function getTemplates() {
    SupersetClient.get({ endpoint: `/api/templates` })
      .then(({ json }) => {
        // 判断是否合法
        const templatesInfo = json;
        setTemplatesInfo(templatesInfo);
        const templateOptions = templatesInfo.map((item, index) => ({
          label: item.label,
          value: index,
        }));
        setTemplateOptions(templateOptions);
      })
      .catch(err => {
        console.log(err);
        // 这里要改成错误提示信息
      });
  }

  useEffect(() => {
    getTemplates();
  }, []);

  useEffect(() => {
    if (currentTemplate) {
      const par = {};
      templatesInfo[currentTemplate.value].params.forEach(item => {
        par[item.name] = null;
      });
      setParams(par);
      props.onTemplateChange(templatesInfo[currentTemplate.value].template_id);
    }
    setParams({});
  }, [currentTemplate]);

  function changeTemplate(template) {
    if (template) {
      setCurrentTemplate(template);
    }
  }

  function renderSelectRow(select) {
    return (
      <div className="section">
        <span className="select">{select}</span>
        <span className="refresh">
          <RefreshLabel
            onClick={() => getTemplates()}
            tooltipContent={t('Force refresh table list')}
          />
        </span>
      </div>
    );
  }

  function renderInputRow(input, label) {
    return (
      <>
        <FormLabel key={`form_${label}`}>{label}</FormLabel>
        <div className="section" key={`input_${label}`}>
          <span className="input">{input}</span>
          <span className="refresh" />
        </div>
      </>
    );
  }
  function renderMultipleInputRow(template, func) {
    return <MultipleInput template={template} onChange={func} />;
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
  function changeParam(id, value) {
    const currentPayload = params;
    currentPayload[id] = value;
    setParams(currentPayload);
    props.onParamsChange(params);
  }

  function renderParamsInput(templateParam) {
    return templateParam.description.indexOf('json数组') === -1
      ? renderInputRow(
          <Input
            placeholder={templateParam.description}
            key={templateParam.toString()}
            onChange={e => changeParam(e.target.id, e.target.value)}
            id={templateParam.name}
          />,
          templateParam.name,
        )
      : renderMultipleInputRow(templateParam, changeParam);
  }

  return (
    <>
      <TemplateSelectorWrapper>
        {renderTemplateSelect()}
        {currentTemplate &&
          templatesInfo[currentTemplate.value].params.map(item =>
            renderParamsInput(item),
          )}
      </TemplateSelectorWrapper>
    </>
  );
}
