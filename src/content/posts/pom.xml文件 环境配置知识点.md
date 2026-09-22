---
title: pom.xml文件 环境配置知识点
published: 2026-09-21
description: pom.xml文件 环境配置知识点
image: ''
tags: []
category: ''
draft: false
lang: ''
slug: huan-jing-pei-zhi
---


# 一、父 pom eams-parent/pom.xml 逐块解释
## 1. 工程坐标
XML

1
2
3
4

`<groupId>com.eams</groupId>
<artifactId>eams-parent</artifactId>
<version>1.0.0-SNAPSHOT</version>
<packaging>pom</packaging>`

元素 值 作用 `groupId` `com.eams` 团队/公司标识（域名倒序），所有子模块继承 `artifactId` `eams-parent` 工程唯一名 `version` `1.0.0-SNAPSHOT` 版本号。`-SNAPSHOT` 表示 快照版本 （不稳定、可覆盖），正式发布要改成`1.0.0` （不带 SNAPSHOT） `packaging` `pom` 关键字段 ：父工程/聚合工程必须是`pom` ，表示"不打包 jar/war，只用于管理"

### 知识点
- 三段坐标 ：groupId + artifactId + version 唯一定位一个 Maven 项目
- SNAPSHOT vs RELEASE ：SNAPSHOT 会被本地仓库不断覆盖（开发期），RELEASE 一旦发布不可变（生产期）
- 版本号规范 ：`主版本.次版本.增量版本` 三段式（语义化版本 SemVer），企业里写`1.0.0-SNAPSHOT` 比`1.0-SNAPSHOT` 更规范
## 2. 继承 Spring Boot 父 POM
XML

1
2
3
4
5
6

`<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
    <relativePath/>
</parent>`

元素 作用 `groupId/artifactId` 继承 Spring Boot 提供的父 pom `version` 锁定整个项目的 Spring Boot 版本（3.2.5） `<relativePath/>` 空标签表示"从仓库找，不从本地文件系统找" 。如果父 pom 在本地有路径，会写`<relativePath>../pom.xml</relativePath>`

### 知识点
- 继承链 ：你的父 pom → spring-boot-starter-parent → spring-boot-dependencies (BOM)
- 为什么继承 Spring Boot 父 ：拿到所有 Spring Boot 自带依赖的版本管理（不用写 version）、Java 编译插件配置、资源过滤配置、UTF-8 默认、Spring Boot Maven 插件配置
- `<relativePath/>` vs`<relativePath>../pom.xml</relativePath>` ：
  - 空标签：父 pom 在 Maven 仓库里（如 spring-boot-starter-parent 不在你本地工程里）
  - 有路径：父 pom 是本地工程（如 eams-common 的`<parent>` 指向 eams-parent 时用`../pom.xml` ）
## 3. 子模块声明
XML

1
2
3

`<modules>
    <module>eams-common</module>
</modules>`

元素 作用 `<modules>` 聚合声明：Maven 编译父工程时，会 按声明顺序 编译所有子模块 `<module>eams-common</module>` 子模块路径（相对父 pom 所在目录）。路径 =`eams-common` ，对应`D:\Project1\eams-parent\eams-common\`

### 知识点
- 聚合 vs 继承 ：Maven 多模块有这两个概念
  - 聚合 ：父 pom 用`<modules>` 声明子模块，子模块 不必 继承父 pom（可以只聚合不继承）
  - 继承 ：子 pom 用`<parent>` 声明父 pom，子模块 不必 在父的`<modules>` 里（可以只继承不聚合）
  - 企业实战 ：通常 两个同时用 ——父既聚合又继承，方便统一管理
- 路径写法 ：相对父 pom 目录的相对路径
  - `eams-common` →`D:\Project1\eams-parent\eams-common\`
  - 如果写错成`eams-common/eams-common` → Maven 找不到子 pom，报错
- 顺序很重要 ：如果 A 依赖 B，B 必须在 A 前面声明（虽然 Maven 会自动按依赖图排序，但建议手动按依赖顺序排）
## 4. 版本号集中管理
XML

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22

`<properties>
    <java.version>17</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>

    <spring-cloud.version>2023.0.1</spring-cloud.version>
    <spring-cloud-alibaba.version>2023.0.1.0</spring-cloud-alibaba.version>

    <mybatis-plus.version>3.5.5</mybatis-plus.version>
    <druid.version>1.2.22</druid.version>

    <caffeine.version>3.1.8</caffeine.version>

    <spring-security-oauth2-authorization-server.version>1.2.3</spring-security-oauth2-authorization-server.version>
    <jjwt.version>0.12.5</jjwt.version>

    <knife4j.version>4.4.0</knife4j.version>

    <hutool.version>5.8.27</hutool.version>
    <mapstruct.version>1.5.5.Final</mapstruct.version>
    <lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>
</properties>`

### 每个版本为什么是这个
属性 版本 为什么 `java.version` 17 LTS 版本，Boot 3 最低要求 17（Boot 3 不支持 8 / 11） `spring-cloud.version` 2023.0.1 Spring Cloud 2023.x 是为 Boot 3.2 设计的， 必须配 Boot 3.2.x `spring-cloud-alibaba.version` 2023.0.1.0 匹配 Spring Cloud 2023.x `mybatis-plus.version` 3.5.5 必须 ≥ 3.5.3 ，否则不支持 Boot 3（jakarta 命名空间） `druid.version` 1.2.22 用`druid-spring-boot-3-starter` ，必须 Boot 3 适配版 `spring-security-oauth2-authorization-server.version` 1.2.3 1.2.x 配 Boot 3.2 / Spring Security 6.2 `jjwt.version` 0.12.5 jjwt 0.12.x 重写过 API，比 0.11.x 更现代 `knife4j.version` 4.4.0 Knife4j 4.x 才支持 Boot 3 + OpenAPI 3 + jakarta `hutool.version` 5.8.27 5.8.x 稳定版 `mapstruct.version` 1.5.5.Final 1.5.x 配 Boot 3 兼容 `caffeine.version` 3.1.8 3.x 需要 JDK 11+，配 17 OK

### 知识点
- `<properties>` 用法 ：定义变量，下面用`${变量名}` 引用
- 为什么要集中 ：版本升级时只改一处，所有子模块跟着变
- 特殊变量 ：`java.version` 不是普通属性，Spring Boot 父 pom 会读取它来设置`maven.compiler.source/target` 。你直接写`<maven.compiler.source>17</maven.compiler.source>` 也可以，但用`java.version` 是 Spring Boot 的惯例
- `project.build.sourceEncoding` ：Java 源码编码，不写的话 Maven 默认是 GBK（Windows），写 UTF-8 避免中文乱码
- `project.reporting.outputEncoding` ：Maven 生成的 site/ 报告输出编码
## 5. 依赖版本锁（dependencyManagement）
XML

1
2
3
4
5
6
7
8
9
10
11
12

`<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        ...
    </dependencies>
</dependencyManagement>`

### 三种依赖块的区别
标签 作用 子模块是否自动引入 `<dependencyManagement>` 只锁版本，不实际引入 否。子模块需要用时再声明，version 不写 `<dependencies>` 实际引入 是。所有子模块自动继承这些依赖 BOM`<scope>import</scope>` 导入另一个 pom 的 dependencyManagement 否。等价于"把别人的版本锁抄过来"

### 每个 dependency 的作用
依赖 类型 说明 `spring-cloud-dependencies` BOM Spring Cloud 全家桶版本锁 `spring-cloud-alibaba-dependencies` BOM Spring Cloud Alibaba 全家桶版本锁 `mybatis-plus-spring-boot3-starter` 普通依赖锁 关键：是`spring-boot3-starter` ，不是`boot-starter` `druid-spring-boot-3-starter` 普通依赖锁 同理，Boot 3 专用 `spring-security-oauth2-authorization-server` 普通依赖锁 OAuth2 认证服务器 `jjwt-api / jjwt-impl / jjwt-jackson` 三件套 API 接口 / 默认实现 / Jackson 序列化 `knife4j-openapi3-jakarta-spring-boot-starter` 普通依赖锁 OpenAPI 3 + jakarta（Boot 3） `knife4j-gateway-spring-boot-starter` 普通依赖锁 网关聚合文档专用 `hutool-all` 普通依赖锁 工具包 `caffeine` 普通依赖锁 本地缓存 `mapstruct` 普通依赖锁 对象映射 `eams-common / eams-data` 自家子模块锁 子模块互相引用时不用写 version

### 知识点
- BOM 是什么 ：Bill of Materials，物料清单。本质就是一个 pom，里面只有`<dependencyManagement>` ，导入它就能拿到一组版本互斥的依赖版本组合
- `<type>pom</type>` ：默认是`jar` 。BOM 是 pom 类型，需要显式声明
- `<scope>import</scope>` ：只能配 BOM 用，表示"导入这个 pom 的 dependencyManagement"
- 三件套依赖的 scope ：
  - `jjwt-api` ：compile（默认），编译期可见
  - `jjwt-impl` ：runtime，运行期才需要
  - `jjwt-jackson` ：runtime，运行期才需要
  - 拆开的原因 ：让你代码里只用 API 接口，实现可以替换
- scope 取值表 ：
  - `compile` （默认）：编译、测试、运行都可见
  - `provided` ：编译、测试可见，运行期由容器提供（如 Tomcat 提供 servlet-api）
  - `runtime` ：测试、运行可见，编译期不可见（如 JDBC 驱动）
  - `test` ：仅测试可见
  - `system` ：本地 jar，需显式路径（不推荐）
  - `import` ：仅用于 BOM
## 6. 所有子模块继承的依赖
XML

1
2
3
4
5
6
7
8
9
10
11
12

`<dependencies>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>`

依赖 作用 说明 `lombok` 简化 POJO（@Data/@Slf4j 等） `<optional>true</optional>` 表示 不传递给下游 。子模块继承 lombok 给自己用，但子模块的依赖方（如 war 包/外部项目）不会自动拿到 lombok `spring-boot-starter-test` 测试套件（JUnit 5 + Mockito + AssertJ 等） `<scope>test</scope>` 表示只在测试代码里用

### 知识点
- 父 pom`<dependencies>` 会传递给所有子模块 ——所以放在这里的东西要慎重：
  - 真正所有子模块都需要的（如 lombok、test）→ 放这里
  - 不是所有子模块都需要的（如 web、mybatis）→ 不要放这里，放各自子 pom 的`<dependencies>` 里
- `<optional>` 的作用 ：阻止依赖传递。比如：
  - A 依赖 Lombok，A 标记为 optional
  - B 依赖 A，B 不会自动得到 Lombok
  - 想用 Lombok 需要在 B 自己的 pom 里再声明一次
  - Lombok 这种"编译期工具"应该 optional ，避免污染下游
- 为什么只放这两个 ：
  - 不放 spring-boot-starter-web ：网关模块是 WebFlux，不能引 web，所以不能放父
  - 不放 mybatis-plus ：网关模块不需要数据库
  - 不放 redis ：只有缓存相关的业务服务需要
## 7. 构建配置
XML

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21

`<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>...</configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>${project.build.sourceEncoding}</encoding>
                    <annotationProcessorPaths>...</annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </pluginManagement>
</build>`

插件 作用 `spring-boot-maven-plugin` 打可执行 jar（带`repackage` goal），业务服务要打 fat jar 用 `maven-compiler-plugin` 编译 Java 源码，配 source/target 版本、注解处理器

### annotationProcessorPaths 解释
XML

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16

`<annotationProcessorPaths>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </path>
    <path>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct-processor</artifactId>
        <version>${mapstruct.version}</version>
    </path>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok-mapstruct-binding</artifactId>
        <version>${lombok-mapstruct-binding.version}</version>
    </path>
</annotationProcessorPaths>`

### 知识点
- pluginManagement vs plugins ：
  - `<pluginManagement>` ： 只锁配置，不实际应用 。子模块声明同 id 的 plugin 才生效
  - `<plugins>` ：直接应用插件
  - 类似 dependencyManagement / dependencies 的关系
- spring-boot-maven-plugin 的作用 ：
  - `repackage` goal：把普通 jar 重新打包成可执行 fat jar（包含所有依赖 + 嵌入 Tomcat）
  - 业务服务（eams-course / eams-system 等）需要打 fat jar 部署
  - 公共模块（eams-common）不需要打 fat jar， 子模块 pom 里不要声明这个插件
- `<excludes>` 配 lombok ：打 fat jar 时排除 lombok（lombok 是编译期工具，运行期不需要）
- annotationProcessorPaths 的作用 ：Maven 3 编译时，把指定的依赖作为 注解处理器 加入编译 classpath
  - Lombok 处理`@Data/@Slf4j` 等注解，生成 getter/setter/log 字段
  - MapStruct 处理`@Mapper` 注解，生成实现类
  - lombok-mapstruct-binding ：解决 Lombok 和 MapStruct 同时使用时的冲突（让 MapStruct 知道 Lombok 生成的字段）
- 顺序很关键 ：Lombok 在前，MapStruct 在后，binding 最后
  - 编译时先让 Lombok 生成 getter/setter
  - 然后 MapStruct 基于已生成的 getter/setter 生成映射代码
  - 否则 MapStruct 找不到 getter/setter
## 8. 仓库加速
XML

1
2
3
4
5
6
7
8
9
10
11
12

`<repositories>
    <repository>
        <id>aliyun-public</id>
        <name>aliyun-public</name>
        <url>https://maven.aliyun.com/repository/public</url>
        <releases><enabled>true</enabled></releases>
        <snapshots><enabled>false</enabled></snapshots>
    </repository>
    ...
</repositories>

<pluginRepositories>...</pluginRepositories>`

元素 作用 `<repositories>` 拉依赖 jar 的仓库 `<pluginRepositories>` 拉构建插件的仓库（分开配，不互通） `<id>` 仓库标识，唯一 `<url>` 仓库 URL `<releases><enabled>true</enabled></releases>` 是否拉取发布版 `<snapshots><enabled>false</enabled></snapshots>` 是否拉取快照版

### 知识点
- 为什么要配阿里云 ：Maven 中央仓库在国外，国内访问慢；阿里云做镜像加速
- 更好的做法：`~/.m2/settings.xml` 配 mirror ——所有项目统一走镜像，pom 里不写 repositories
  - 但写在 pom 里有个好处： 项目自带配置，新人 clone 即用
  - 缺点：pom 暴露仓库地址
- 公共仓库 vs spring 仓库 ：
  - `aliyun-public` ：聚合仓库，包含中央仓库内容
  - `aliyun-spring` ：包含 Spring 生态的官方仓库内容（spring-milestones 等）
  - 配两个，覆盖更广
- `<snapshots><enabled>false</enabled></snapshots>` ：故意不拉 SNAPSHOT 版本，避免业务代码依赖不稳定的快照版
# 二、子 pom eams-common/pom.xml 逐块解释
## 1. 工程坐标 + 继承父 pom
XML

1
2
3
4
5
6
7
8
9
10
11
12

`<modelVersion>4.0.0</modelVersion>

<parent>
    <groupId>com.eams</groupId>
    <artifactId>eams-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <relativePath>../pom.xml</relativePath>
</parent>

<artifactId>eams-common</artifactId>
<name>eams-common</name>
<description>EAMS 公共模块 - 统一响应/异常体系/工具/上下文</description>`

元素 作用 `<parent>` 继承 eams-parent，拿到父 pom 的所有配置（properties、dependencyManagement、build、repositories 全部继承） `<relativePath>../pom.xml</relativePath>` 父 pom 在本地文件系统的路径，相对当前 pom。Maven 会先按这个路径找，找不到再从仓库找 `<artifactId>eams-common</artifactId>` 子模块自己的 artifactId 没有`<groupId>` 和`<version>` 继承父 pom 的 groupId 和 version ，不写代码更简洁 没有`<packaging>` 默认`jar` ，公共模块要打 jar 给其他模块依赖

### 知识点
- 子模块继承父 pom 的内容 ：properties、dependencyManagement、dependencies、build/pluginManagement、repositories 全部继承
- 为什么不写 groupId/version ：
  - 写了不会报错，但不优雅
  - Maven 推荐做法：能继承就别重复
- `<relativePath>../pom.xml</relativePath>` ：
  - 当前 pom 在`D:\Project1\eams-parent\eams-common\pom.xml`
  - `../pom.xml` 是`D:\Project1\eams-parent\pom.xml` （父 pom）
  - 如果目录嵌套错了一层（比如之前 eams-common/eams-common/ 的问题），就要写`../../pom.xml`
## 2. 依赖
XML

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32

`<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <scope>provided</scope>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    <dependency>
        <groupId>cn.hutool</groupId>
        <artifactId>hutool-all</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
    </dependency>
    <dependency>
        <groupId>com.github.xiaoymin</groupId>
        <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
        <scope>provided</scope>
    </dependency>
</dependencies>`

### 每个依赖为什么这么选
依赖 为什么需要 为什么这个版本 `spring-boot-starter` 提供`@Component/@Configuration/@Autowired` 等基础注解。 不包含 web 容器 Boot 3 自带 `spring-boot-starter-validation` 参数校验：`@Valid/@NotBlank/@NotNull` 。GlobalExceptionHandler 要校验失败异常 Boot 3 自带，jakarta 命名空间 `spring-web` (provided) 提供`@RestControllerAdvice/@ExceptionHandler` 等注解（写在 common 里给业务服务扫描生效） 不带 tomcat，避免污染网关 `jackson-databind` JSON 序列化，`Result<T>` 序列化用 spring-boot-starter 自带，但显式声明更清晰 `hutool-all` 工具包，JwtUtils / 字符串 / 时间 / 加密工具 5.8.x 稳定版 `jjwt-api` JWT 接口，JwtUtils 用 0.12.x 新版 API `knife4j-openapi3-jakarta-spring-boot-starter` (provided) OpenAPI 公共配置类用，写在 common 里给业务服务扫描 jakarta 版本对应 Boot 3

### 知识点 Q1: 为什么 spring-web 和 knife4j 用 provided？
Plain Text

1
2
3
4
5

`                网关 eams-gateway (WebFlux)
                    │ 依赖 eams-common
                    ↓
eams-common      ← spring-web (provided) = 编译期有，运行期没有
eams-common      ← knife4j  (provided) = 同上`

- 如果不写 provided（默认 compile） ：
  - eams-common 引入 spring-web，spring-web 会传递依赖 spring-boot-starter-tomcat
  - 网关 eams-gateway 依赖 eams-common，tomcat 被传递进来
  - 网关本来用 WebFlux（reactive），又被引了 Tomcat（servlet）， 启动直接报错：Cannot use both reactive and servlet
- 写 provided ：
  - 编译期可以用 spring-web 的注解（@RestControllerAdvice）
  - 运行期不传递给下游
  - 业务服务 eams-course 自己引`spring-boot-starter-web` （带 tomcat），common 提供的`@RestControllerAdvice` 类被业务服务的 web 容器扫描生效 Q2: 为什么不直接引 spring-boot-starter-web？
- `spring-boot-starter-web` =`spring-web` +`spring-webmvc` +`tomcat` +`jackson` +`validator`
- common 只用到`@RestControllerAdvice` （属于 spring-web）
- 引整个 web 会带 tomcat → 污染所有依赖 common 的模块（包括网关） Q3: 为什么 jjwt 只引 api 不引 impl？
- `jjwt-api` 只有接口（`JwtBuilder` 、`JwtParser` ）
- `jjwt-impl` 是默认实现，`jjwt-jackson` 是 JSON 序列化
- 设计哲学 ：让代码只依赖接口，实现可替换
- 但是只用 api 在运行期会`ClassNotFoundException` ，所以 调用方（如 eams-auth）必须显式引 impl + jackson
- 父 pom 锁了三件套版本，业务服务只要声明就会引到 Q4: 为什么 eams-common 没写 version？
- 父 pom 的`<dependencyManagement>` 已经锁了所有版本
- 子模块声明依赖时 不写 version ，Maven 会自动从父 pom 的 dependencyManagement 查
- 这就是父 pom 集中管理版本的好处 Q5: 为什么 eams-common 没声明 lombok / test？
- 父 pom 的`<dependencies>` 块里写了 lombok 和 spring-boot-starter-test
- 父 pom 的`<dependencies>` （不是 dependencyManagement）会 自动继承到所有子模块
- 所以子模块不用再写一遍
# 三、知识点总览
## A. Maven 多模块必懂概念
概念 区别 聚合 父 pom 用`<modules>` 声明子模块，作用是"批量编译" 继承 子 pom 用`<parent>` 声明父 pom，作用是"共享配置" 两者关系 可以只聚合不继承、只继承不聚合、或两者都有（企业常用）

## B. 三个 dependencies 块的对比
块 引入依赖？ 子模块自动继承？ 父 pom`<dependencyManagement>` ❌ 只锁版本 ❌ 子模块需要时自己声明（不写 version） 父 pom`<dependencies>` ✅ 实际引入 ✅ 所有子模块自动继承 子 pom`<dependencies>` ✅ 实际引入 ❌ 只对自身生效

## C. scope 取值
scope 编译期 测试期 运行期 传递给下游 用法 `compile` （默认） ✅ ✅ ✅ ✅ 大部分依赖 `provided` ✅ ✅ ❌ ❌ 容器提供的（servlet-api、需要隔离的 web 注解） `runtime` ❌ ✅ ✅ ✅ JDBC 驱动、jjwt-impl `test` ❌ ✅ ❌ ❌ JUnit、Mockito `import` ❌ ❌ ❌ ❌ 只用于 BOM

## D. Boot 3 / Spring Cloud 2023 版本兼容矩阵
Boot Spring Cloud Spring Cloud Alibaba Java 3.0.x 2022.0.x 2022.0.x 17+ 3.1.x 2022.0.x 2022.0.x 17+ 3.2.x 2023.0.x 2023.0.x 17+ 3.3.x 2023.0.x 2023.0.x 17+

重要版本陷阱（Boot 3 必踩） ：

1. `mybatis-plus-boot-starter` ❌ →`mybatis-plus-spring-boot3-starter` ✅
2. `druid-spring-boot-starter` ❌ →`druid-spring-boot-3-starter` ✅
3. `knife4j-spring-boot-starter` ❌ →`knife4j-openapi3-jakarta-spring-boot-starter` ✅
4. `javax.servlet.*` ❌ →`jakarta.servlet.*` ✅
5. `spring-cloud-starter-oauth2` ❌（已废弃） → 用`spring-security-oauth2-authorization-server` ✅
## E. 注解处理器机制
- 编译期工具（Lombok、MapStruct）不参与运行，只在编译时生成代码
- 通过`<annotationProcessorPaths>` 配置， 不通过`<dependencies>`
- Lombok + MapStruct 共存要加`lombok-mapstruct-binding` ，否则 MapStruct 看不到 Lombok 生成的 getter/setter
## F. 阿里云 Maven 仓库
- `https://maven.aliyun.com/repository/public` ：聚合仓库，覆盖中央仓库
- `https://maven.aliyun.com/repository/spring` ：Spring 生态专用
- `https://maven.aliyun.com/repository/spring-cloud` ：Spring Cloud 相关
- 配在 pom 里 vs 配在`~/.m2/settings.xml` 的`<mirror>` ：
  - pom：项目自带，新人 clone 即用，但暴露在工程里
  - settings.xml：本机统一加速，新人 clone 后还要自己配
  - 企业通常用 settings.xml + 私服（Nexus）
# 四、面试时可能被问到的高频问题
1. 为什么父工程 packaging 是 pom？ 父工程不输出 jar/war，只用于聚合子模块和共享配置。pom 类型表示这是个"虚拟"项目，Maven 不会给它打 jar 包。
2. dependencyManagement 和 dependencies 的区别？ 前者只锁版本不引入，子模块用时不用写 version；后者实际引入并继承给所有子模块。
3. 为什么网关不能用 spring-boot-starter-web？ Spring Cloud Gateway 是基于 WebFlux（反应式栈）的，引入 starter-web 会带 Tomcat（Servlet 栈），两者不能共存，启动直接报错。
4. Lombok 为什么标 optional？ 阻止依赖传递。Lombok 是编译期工具，运行期不需要，不希望下游项目通过传递依赖自动拿到 Lombok。
5. jjwt 为什么要拆成 api / impl / jackson 三个包？ 这是接口与实现分离的设计模式。代码里只用 api 包的接口，编译期不依赖具体实现；运行期由调用方引入 impl + jackson。好处是未来可以换 JSON 库或换实现。
6. Spring Boot 3 为什么用 jakarta 而不是 javax？ Java EE 在 Jakarta EE 9 之后把命名空间从`javax.*` 改成`jakarta.*` ，Spring Boot 3 全面跟进 Jakarta EE 9+，所以所有依赖也要用 jakarta 版本（MyBatis-Plus、Druid、Knife4j 都有 jakarta 专用版本）。
7. 聚合和继承必须一起用吗？ 不必须。聚合是"批量编译"，继承是"共享配置"。可以只聚合（多模块编译但每个模块独立）或只继承（共享父配置但单独编译）。企业实战通常两个都用。
8. `<relativePath/>` 空标签和有路径的区别？ 空标签表示从仓库找父 pom；有路径表示从本地文件系统找。继承 spring-boot-starter-parent 用空（不在本地工程里）；继承自家父 pom 用`../pom.xml` 。


