/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
package com.yahoo.navi.spring;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import com.yahoo.navi.ws.models.permissions.PermissionExpressions;
import com.yahoo.elide.security.checks.Check;
import com.yahoo.elide.core.EntityDictionary;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@EntityScan("com.yahoo.navi.ws.models")
public class NaviAutoConfiguration {
  @Bean
  @SuppressWarnings("unchecked")
  public EntityDictionary buildDictionary(AutowireCapableBeanFactory beanFactory) {
      Map<String, java.lang.Class<? extends Check>> expressions = (Map)PermissionExpressions.expressions;
      return new EntityDictionary(expressions, beanFactory::autowireBean);
  }
}