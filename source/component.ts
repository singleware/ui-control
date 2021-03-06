/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as DOM from '@singleware/jsx';

import { Properties } from './properties';

/**
 * Component class.
 */
@Class.Describe()
export class Component<T extends Properties> extends Class.Null implements JSX.ElementClass {
  /**
   * Component properties.
   * (Public at compile-time, Protected at run-time)
   */
  @Class.Protected()
  public readonly properties: T;

  /**
   * Component children.
   */
  @Class.Protected()
  protected readonly children: any[];

  /**
   * Gets the property descriptor that corresponds to the specified property name and prototype source.
   * @param prototype Prototype source.
   * @param property Property name.
   * @returns Returns the corresponding property descriptor or undefined when the property was not found.
   */
  @Class.Private()
  private getPropertyDescriptor(prototype: Object, property: PropertyKey): PropertyDescriptor | undefined {
    let descriptor;
    while (!(descriptor = Object.getOwnPropertyDescriptor(prototype, property))) {
      if (!(prototype = Reflect.getPrototypeOf(prototype))) {
        break;
      }
    }
    return descriptor;
  }

  /**
   * Binds the property descriptor from the specified prototype to be called with this instance context.
   * @param prototype Source prototype.
   * @param property Property name.
   * @returns Returns a new property descriptor.
   * @throws Throws an error when the specified property was not found.
   */
  @Class.Private()
  private bindDescriptor(prototype: Object, property: PropertyKey): PropertyDescriptor {
    const descriptor = this.getPropertyDescriptor(prototype, property);
    if (!descriptor) {
      throw new Error(`Property '${property as string}' was not found.`);
    }
    const newer = { ...descriptor };
    if (newer.value) {
      newer.value = newer.value.bind(this);
    } else {
      if (newer.get) {
        newer.get = newer.get.bind(this);
      }
      if (newer.set) {
        newer.set = newer.set.bind(this);
      }
    }
    return newer;
  }

  /**
   * Bind all specified properties from this instance into the target object.
   * @param target Target object.
   * @param properties Properties to be assigned.
   */
  @Class.Protected()
  protected bindComponentProperties(target: HTMLElement, properties: string[]): void {
    const prototype = Reflect.getPrototypeOf(this);
    for (const property of properties) {
      Reflect.defineProperty(target, property, this.bindDescriptor(prototype, property));
    }
  }

  /**
   * Assign all mapped values by the specified properties into this instance.
   * @param values Values to be assigned.
   * @param properties Properties to be assigned.
   * @throws Throws an error when some specified property does not exists in this instance.
   */
  @Class.Protected()
  protected assignComponentProperties(values: Object, properties: string[]): void {
    for (const property of properties) {
      if (property in values) {
        if (!(property in this)) {
          throw new Error(`Property '${property}' can't be assigned.`);
        }
        (this as any)[property] = (values as any)[property];
      }
    }
  }

  /**
   * Default constructor.
   * @param properties Initial properties.
   * @param children Initial children.
   */
  constructor(properties?: T, children?: any[]) {
    super();
    this.properties = Object.freeze(properties || {}) as T;
    this.children = Object.freeze(children || []) as any[];
  }

  /**
   * Gets the component instance.
   * @throws Always throw an exception when not implemented.
   */
  @Class.Public()
  public get element(): any {
    throw new Error(`Component not implemented.`);
  }
}
