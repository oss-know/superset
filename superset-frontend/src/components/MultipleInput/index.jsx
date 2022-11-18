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
import DeleteLabel from 'src/components/DeleteLabel';
import AddLabel from 'src/components/AddLabel';
import { Input } from 'src/components/Input';
import { FormLabel } from 'src/components/Form';

const FormInputWrapper = styled.div`
  ${({ theme }) => `    
     .add-label, .del-label{
       display: flex;
       align-items: center;
       width: 30px;
       margin-left: ${theme.gridUnit}px;
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

export default function MultipleInput(props) {
  const [list, setList] = useState([]);
  const [id, setId] = useState(0);

  useEffect(() => {
    setList([
      ...list,
      {
        index: id,
        value: '',
        show: true,
      },
    ]);
    setId(id + 1);
  }, []);

  function onChange(id, value) {
    const newList = list;
    newList[id].value = value;
    setList(newList);
    props.onChange(
      props.template.name,
      JSON.stringify(newList.filter(el => el.value !== '').map(el => el.value)),
    );
  }

  function AddInputBox() {
    setList([
      ...list,
      {
        index: id,
        value: '',
        show: true,
      },
    ]);
    setId(id + 1);
  }
  function deleteInput(index) {
    const li = list.filter(el => el.index !== index);
    setList(li);
  }
  function renderInputRow(input, index) {
    return (
      <div className="section" key={`multi_input_${index}`}>
        <span className="input">{input}</span>
        <span className="del-label">
          {list.length > 1 ? (
            <DeleteLabel onClick={() => deleteInput(index)} />
          ) : (
            ''
          )}
        </span>
      </div>
    );
  }

  return (
    <FormInputWrapper>
      <FormLabel key={`multi_form_${props.template.name}`}>
        {props.template.name}{' '}
        <AddLabel
          onClick={() => AddInputBox()}
          tooltipContent={t('点击以添加更多元素')}
        />
      </FormLabel>

      {list.map(el =>
        renderInputRow(
          <Input
            onChange={e => onChange(el.index, e.target.value)}
            placeholder={props.template.description}
            id={el.index}
            key={el.index}
          />,
          el.index,
        ),
      )}
    </FormInputWrapper>
  );
}
